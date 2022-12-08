(namespace 'free)

(define-keyset "free.stake-for-steak-keyset" (read-keyset 'stake-for-steak-keyset))

(module stake-for-steak GOVERNANCE
  (defcap GOVERNANCE ()
    (enforce-guard (read-keyset "free.stake-for-steak-keyset")))

  (defcap STAKE_FOR_STEAK ()
    true)

  (use coin)

  ; Schema for the stake
  (defschema stake-schema
    ; Account to credit for this stake
    merchant:string
    ; Owner of the stake
    owner:string
    ; Guard of the owner
    owner-guard:guard
    ; Amount to stake
    stake:decimal
    ; Amount of stakers
    stakers:integer
    ; The balance of the stake
    balance:decimal)
  (deftable stake-table:{stake-schema})

  ; Schema for the stakers
  ; Key of the table will consist of {stake-name}-{staker}
  (defschema stakers-schema
    stake:string
    staker:string
    ; The amount staked
    amount:decimal
    guard:guard)
  (deftable stakers-table:{stakers-schema})

  (defun stake-guard:bool (owner-guard:guard)
    (require-capability (STAKE_FOR_STEAK))
    (enforce-guard owner-guard))

  (defun create-stake-guard:guard(owner-guard:guard)
    (create-user-guard (stake-guard owner-guard)))

  (defun create-stake(name:string
                      merchant:string
                      owner:string
                      owner-guard:guard
                      stake:decimal)
    @doc "Create a stake where all stakers know where the destination would go to"
    @model [
      (property (> stake 0.0))
      (property (!= name ""))
      (property (!= merchant ""))
      (property (!= owner ""))
    ]

    (enforce (> stake 0.0) "Stake must be greater than 0.0")
    (enforce (!= name "") "Name must not be empty")
    (enforce (!= merchant "") "Merchant must not be empty")

    (let ((stake-escrow:string (get-stake-id name owner)))
      (create-account stake-escrow (create-stake-guard owner-guard))
      (insert stake-table name
        { "merchant"    : merchant
        , "owner"       : owner
        , "owner-guard" : owner-guard
        , "stake"       : stake
        , "stakers"     : 0
        , "balance"     : 0.0 })
      (fund-stake name owner owner-guard)))

  (defun get-stake(name:string)
    (with-read stake-table name
      { "merchant" := merchant
      , "stake"    := stake
      , "owner"    := owner
      , "stakers"  := stakers
      , "balance"  := balance }
      { "name"     : name
      , "merchant" : merchant
      , "owner"    : owner
      , "stake"    : stake
      , "stakers"  : stakers
      , "balance"  : balance }))

  (defun fund-stake(name:string staker:string staker-guard:guard)
    (with-read stake-table name
      { "owner"       := owner
      , "stake"       := stake
      , "stakers"     := stakers
      , "balance"     := balance }
      (let ((stake-escrow:string (get-stake-id name owner)))
        (coin.transfer staker stake-escrow stake)
        (update stake-table name
          { "balance" : (+ balance stake)
          , "stakers" : (+ stakers 1) })
        (insert stakers-table (get-stake-id name staker)
          { "amount" : stake
          , "stake"  : name
          , "staker" : staker
          , "guard"  : staker-guard }))))

  (defun pay(name:string initiator:string amount:decimal)
    (with-read stake-table name
      { "merchant"    := merchant
      , "owner"       := owner
      , "owner-guard" := owner-guard
      , "stakers"     := stakers
      , "balance"     := balance }
      (let ((stake-escrow:string (get-stake-id name owner name)))
        (coin.transfer stake-escrow merchant balance)
        (update stake-table name
          { "balance" : (- balance amount) }))))

  (defun get-stake-id:string (stake:string staker:string)
    ; (enforce (!= stake "") "Stake must not be empty")
    ; (enforce (!= staker "") "Staker must not be empty")
    (format "{}-{}" [staker stake]))

  ; TODO: remove this for actual implementation, only mocked so we can do formal verification
  (defun get-stakers(name:string)
    (let ((stake-owner (read stakers-table (get-stake-id name "stake-owner")))
         (staker (read stakers-table (get-stake-id name "staker"))))
      (filter (where 'amount (!= 0.0)) [stake-owner staker])))
  ; (defun get-stakers(name:string)
  ;   (select stakers-table
  ;     ['staker 'stake 'amount]
  ;     (and?
  ;       (where 'stake (= name))
  ;       (where 'amount (!= 0.0)))))

  (defun refund-staker(name:string staker-id:string escrow-id:string refund:decimal staker:string)
    @model [
      (property
        (=
          (cell-delta stake-table 'balance name)
          (cell-delta stakers-table 'amount staker-id)))
    ]
    (require-capability (STAKE_FOR_STEAK))

    (refund-staker-row staker-id refund)
    (refund-stake-row name refund)
    (coin.transfer escrow-id staker refund))

  (defun refund-staker-row(staker-id:string refund:decimal)
    @model [
      (property (!= staker-id ""))
      (property (> refund 0.0))
      (property (<= refund (at 'amount (read stakers-table staker-id 'before))))
    ]
    (require-capability (STAKE_FOR_STEAK))
    (with-read stakers-table staker-id
      { "amount" := amount }
      (enforce (!= staker-id "") "Staker ID must not be empty")
      (enforce (> refund 0.0) "Refund must be greater than 0.0")
      (enforce (<= refund amount) "Refund must be less than staked amount")
      (update stakers-table staker-id
        { "amount" : (- amount refund) })))

  (defun refund-stake-row(name:string refund:decimal)
    @model [
      (property (!= name ""))
      (property (> refund 0.0))
      (property (>=(at 'balance (read stake-table name 'before)) refund))
      (property (>= (at 'balance (read stake-table name 'after)) 0.0))
    ]
    (require-capability (STAKE_FOR_STEAK))
    (with-read stake-table name
      { "balance" := balance
      , "stakers" := stakers }
      (enforce (!= name "") "Name must not be empty")
      (enforce (> balance 0.0) "Stake has no balance")
      (enforce (> refund 0.0) "Refund must be greater than 0.0")
      (enforce (>= balance refund) "Refund must be less than balance")
      (update stake-table name
        { "balance" : (- balance refund)
        , "stakers" : (- stakers 1) })))

  (defun refund-staker-mapper(name:string owner:string refund staker:string)
    (refund-staker name (get-stake-id name staker) (get-stake-id name owner) refund staker))

  (defun refund-stake(name:string staker-accounts:[string])
    (with-capability (STAKE_FOR_STEAK)
      (with-read stake-table name
        { "owner"           := owner
        , "stakers"         := stakers
        , "stake"           := stake
        , "balance"         := balance }
        (map
          (refund-staker-mapper name owner (/ balance stakers))
          staker-accounts))))

  (defun withdraw(name:string staker:string)
    (with-capability (STAKE_FOR_STEAK)
      (with-read stakers-table (get-stake-id name staker)
        { "amount" := amount }
        (with-read stake-table name
          { "balance" := balance
          , "stakers" := stakers
          , "owner"   := owner }
          (let ((stake-escrow:string (get-stake-id name owner)))
            (coin.transfer stake-escrow staker amount)
            (update stakers-table (get-stake-id name staker)
              { "amount" : 0.0 }))
            (update stake-table name
              { "balance" : (- balance amount)
              , "stakers" : (- stakers 1) })))))
)

(create-table stake-table)
(create-table stakers-table)
