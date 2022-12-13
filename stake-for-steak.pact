(namespace 'free)

(define-keyset "free.stake-for-steak-keyset" (read-keyset 'stake-for-steak-keyset))

(module stake-for-steak GOVERNANCE
  @model [
    (defproperty get-stake-id(name:string staker:string)
      (+ (+ staker "-") name))
    (defproperty staker-exists(name:string staker:string)
      (row-exists stakers-table (get-stake-id name staker) "before"))
    (defproperty get-amount-of-stakers(name:string)
      (length (at 'stakers (read stake-table name "before"))))
    (defproperty get-stake-balance(name:string)
      (at 'balance (read stake-table name "before")))
    (defproperty get-stake-balance-after(name:string)
      (at 'balance (read stake-table name "after")))
    (defproperty get-staked-amount(staker-id:string)
      (at 'amount (read stakers-table staker-id "before")))
    (defproperty has-staked(balance:decimal stakers:integer amount:decimal)
      (<= (/ balance stakers) amount))
    (defproperty conserves-paid-stake(name:string staker:string)
      (>= (/ (get-stake-balance name) (get-amount-of-stakers name))
          (get-staked-amount (get-stake-id name staker))))
    (defproperty conserves-stake-mass (name:string staker:string)
      (= (cell-delta stake-table 'balance name)
         (cell-delta stakers-table 'amount (get-stake-id name staker))))
  ]
  (defcap GOVERNANCE ()
    (enforce-guard (read-keyset "free.stake-for-steak-keyset")))

  (defcap STAKE_FOR_STEAK ()
    true)

  (defcap STAKER (name:string staker:string)
    (with-read stakers-table (get-stake-id name staker)
      { "amount":= amount
      , "guard":= staker-guard }
      (enforce (> amount 0.0) "stake amount must be positive")
      (enforce-guard staker-guard)))

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
    stakers:[string]
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

  (defun stake-guard:bool (name:string staker:string)
    (require-capability (STAKE_FOR_STEAK))
    (require-capability (STAKER name staker)))

  (defun create-stake-guard:guard(name:string staker:string)
    (create-user-guard (stake-guard name staker)))

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
      (coin.create-account stake-escrow (create-stake-guard name owner))
      (insert stake-table name
        { "merchant"    : merchant
        , "owner"       : owner
        , "owner-guard" : owner-guard
        , "stake"       : stake
        , "stakers"     : []
        , "balance"     : 0.0 })
      (fund-stake name owner owner-guard)))

  (defun get-stake(name:string)
    @model [
      (property (!= name ""))
    ]
    (enforce (!= name "") "Name must not be empty")
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
    @model [
      (property (!= name ""))
      (property (!= staker ""))
      (property (not (staker-exists name staker)))
    ]
    (enforce (!= name "") "Name must not be empty")
    (enforce (!= staker "") "Staker must not be empty")
    (with-read stake-table name
      { "owner"       := owner
      , "stake"       := stake
      , "stakers"     := stakers
      , "balance"     := balance }
      (let ((stake-escrow:string (get-stake-id name owner)))
        (coin.transfer staker stake-escrow stake)
        (update stake-table name
          { "balance" : (+ balance stake)
          , "stakers" : (+ stakers [staker]) })
        (insert stakers-table (get-stake-id name staker)
          { "amount" : stake
          , "stake"  : name
          , "staker" : staker
          , "guard"  : staker-guard }))))

  (defun pay(name:string initiator:string amount:decimal)
    @model [
      (property (!= name ""))
      (property (!= initiator ""))
      (property (> amount 0.0))
      (property (>= (get-stake-balance name) amount))
      (property (> (get-staked-amount (get-stake-id name initiator)) 0.0))
    ]
    (enforce (!= name "") "Name must not be empty")
    (enforce (!= initiator "") "Initiator must not be empty")
    (enforce (> amount 0.0) "Amount must be greater than 0.0")
    (with-capability (STAKE_FOR_STEAK)
      (with-read stake-table name
        { "merchant"    := merchant
        , "owner"       := owner
        , "owner-guard" := owner-guard
        , "stakers"     := stakers
        , "balance"     := balance }
        (enforce (>= balance amount) "Not enough balance")
        (let ((stake-escrow:string (get-stake-id name owner)))
          (with-read stakers-table (get-stake-id name initiator)
            { "amount" := staker-amount
            , "guard"  := staker-guard }
            (enforce (> staker-amount 0.0) "Staker has no stake")
            (with-capability (STAKER name initiator)
              (coin.transfer stake-escrow merchant amount)
              (update stake-table name
                { "balance" : (- balance amount) })))))))

  (defun get-stake-id:string (stake:string staker:string)
    ; (enforce (!= stake "") "Stake must not be empty")
    ; (enforce (!= staker "") "Staker must not be empty")
    (format "{}-{}" [staker stake]))

  (defun get-staker(name:string staker:string)
    (with-default-read stakers-table (get-stake-id name staker)
      { "stake"  : name
      , "staker" : staker
      , "amount" : 0.0 }
      { "stake"  := stake
      , "staker" := staker
      , "amount" := amount }
      { "stake"  : stake
      , "staker" : staker
      , "amount" : amount }))

  (defun get-stakers(name:string stakers:[string])
    (map (get-staker name) stakers))

  (defun refund-staker(name:string escrow-id:string refund:decimal staker:string)
    @model [
      (property (!= name ""))
      (property (!= escrow-id ""))
      (property (!= staker ""))
      (property (> refund 0.0))
      (property (conserves-stake-mass name staker))
    ]
    (require-capability (STAKE_FOR_STEAK))

    (refund-staker-row (get-stake-id name staker) refund)
    (refund-stake-row name refund staker)
    (coin.transfer escrow-id staker refund))

  (defun refund-staker-row(staker-id:string refund:decimal)
    @model [
      (property (!= staker-id ""))
      (property (> refund 0.0))
      (property (<= refund (get-staked-amount staker-id)))
    ]
    (require-capability (STAKE_FOR_STEAK))
    (with-read stakers-table staker-id
      { "amount" := amount }
      (enforce (!= staker-id "") "Staker ID must not be empty")
      (enforce (> refund 0.0) "Refund must be greater than 0.0")
      (enforce (<= refund amount) "Refund must be less than staked amount")
      (update stakers-table staker-id
        { "amount" : (- amount refund) })))

  (defun refund-stake-row(name:string refund:decimal staker:string)
    @model [
      (property (!= name ""))
      (property (> refund 0.0))
      (property (>= (get-stake-balance name) refund))
      (property (>= (get-stake-balance-after name) 0.0))
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
        , "stakers" : (filter (!= staker) stakers) })))

  (defun refund-stake(name:string initiator:string staker-accounts:[string])
    (with-capability (STAKE_FOR_STEAK)
      (with-capability (STAKER name initiator)
        (with-read stake-table name
          { "owner"           := owner
          , "stakers"         := stakers
          , "stake"           := stake
          , "balance"         := balance }
          (let ((escrow-id (get-stake-id name owner))
                (refund (get-refund balance (length stakers))))
            (map
              (refund-staker name escrow-id refund)
              staker-accounts))))))

  (defun get-refund:decimal(balance:decimal stakers:integer)
    @model [
      (property (> balance 0.0))
      (property (> stakers 0))
    ]
    (enforce (> balance 0.0) "Balance must be greater than 0.0")
    (enforce (> stakers 0) "Stakers must be greater than 0")
    (/ balance stakers))

  (defun withdraw(name:string staker:string)
    (with-capability (STAKE_FOR_STEAK)
      (with-capability (STAKER name staker)
        (enforce (!= name "") "Name must not be empty")
        (enforce (!= staker "") "Staker must not be empty")
        (with-read stake-table name
          { "balance" := balance
          , "stakers" := stakers
          , "owner"   := owner }
          (let ((stake-escrow:string (get-stake-id name owner))
                (left-over:decimal (get-left-over name)))
            (coin.transfer stake-escrow staker left-over)
            (withdraw-stake name staker)
            (withdraw-staker (get-stake-id name staker) left-over))))))

  (defun get-left-over:decimal (name:string)
    @model [
      (property (!= name ""))
      (property (> (get-stake-balance name) 0.0))
      (property (> (get-amount-of-stakers name) 0))
    ]
    (with-read stake-table name
      { "balance" := balance
      , "stakers" := stakers }
      (enforce (!= name "") "Name must not be empty")
      (enforce (> balance 0.0) "Stake has no balance")
      (enforce (> (length stakers) 0) "Stake has no stakers")
      (let ((left-over:decimal (/ balance (length stakers))))
        (enforce (>= left-over 0.0) "Left over must be greater than 0.0")
        left-over)))

  (defun withdraw-staker(stake-id:string left-over:decimal)
    @model [
      (property (!= stake-id ""))
      (property (> left-over 0.0))
      (property (<= left-over (get-staked-amount stake-id)))
    ]
    (require-capability (STAKE_FOR_STEAK))
    (enforce (!= stake-id "") "Stake ID must not be empty")
    (enforce (> left-over 0.0) "Left over must be greater than 0.0")
    (with-read stakers-table stake-id
      { "amount" := staker-amount }
      (enforce (<= left-over staker-amount) "Staker has not staked")
      (update stakers-table stake-id
        { "amount" : 0.0 })))

  (defun withdraw-stake(name:string staker:string)
    @model [
      (property (!= name ""))
      (property (> (get-stake-balance name) 0.0))
      (property (>= (get-stake-balance-after name) 0.0))
      (property (> (get-amount-of-stakers name) 0))
    ]
    (require-capability (STAKE_FOR_STEAK))
    (enforce (!= name "") "Name must not be empty")
    (with-read stake-table name
      { "balance" := balance
      , "stakers" := stakers }
      (enforce (> balance 0.0) "Stake has no balance")
      (enforce (> (length stakers) 0) "Stake has no stakers")
      (let ((left-over:decimal (/ balance (length stakers))))
        (update stake-table name
          { "balance" : (- balance left-over)
          , "stakers" : (filter (!= staker) stakers) }))))
)

(create-table stake-table)
(create-table stakers-table)
