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
    (let ((stake-escrow:string (get-stake-id name owner)))
      (create-account stake-escrow (create-stake-guard owner-guard))
      (insert stake-table name {
        "merchant"    : merchant,
        "owner"       : owner,
        "owner-guard" : owner-guard,
        "stake"       : stake,
        "balance"     : 0.0
      })
      (fund-stake name owner owner-guard)))

  (defun get-stake(name:string)
    (with-read stake-table name
      { "merchant" := merchant
      , "stake"    := stake
      , "owner"    := owner
      , "balance"  := balance }
      { "name"     : name
      , "merchant" : merchant
      , "owner"    : owner
      , "stake"    : stake
      , "balance"  : balance }))

  (defun fund-stake(name:string staker:string staker-guard:guard)
    (with-read stake-table name
      { "owner"       := owner
      , "stake"       := stake
      , "balance"     := balance }
      (let ((stake-escrow:string (get-stake-id name owner)))
        (coin.transfer staker stake-escrow stake)
        (update stake-table name
          { "balance" : (+ balance stake) })
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
      , "balance"     := balance }
      (let ((stake-escrow:string (get-stake-id name owner name)))
        (coin.transfer stake-escrow merchant balance)
        (update stakers-table name
          { "amount" : 0.0 }))))

  (defun get-stake-id(stake:string staker:string)
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

  (defun refund-staker(name:string stake-escrow:string staker:object{stakers-schema})
    (require-capability (STAKE_FOR_STEAK))
    (coin.transfer stake-escrow (at 'staker staker) (at 'amount staker))
    (update stakers-table (get-stake-id name (at 'staker staker))
      { "amount" : 0.0 }))

  (defun refund-stake(name:string)
    (with-capability (STAKE_FOR_STEAK)
      (with-read stake-table name
        { "owner" := owner
        , "balance" := balance }
        (let ((stake-escrow:string (get-stake-id name owner)))
          (map
            (refund-staker name stake-escrow)
            (get-stakers name))
          (update stake-table name
            { "balance" : 0.0 })))))

  (defun withdraw(name:string staker:string)
    (with-capability (STAKE_FOR_STEAK)
      (with-read stakers-table (get-stake-id name staker)
        { "amount" := amount }
        (with-read stake-table name
          { "balance" := balance
          , "owner"   := owner }
          (let ((stake-escrow:string (get-stake-id name owner)))
            (coin.transfer stake-escrow staker amount)
            (update stakers-table (get-stake-id name staker)
              { "amount" : 0.0 }))
            (update stake-table name
              { "balance" : (- balance amount) })))))
)

(create-table stake-table)
(create-table stakers-table)
