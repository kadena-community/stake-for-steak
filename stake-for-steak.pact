(namespace 'free)

(define-keyset "free.stake-for-steak-keyset" (read-keyset 'stake-for-steak-keyset))

(module keoy GOVERNANCE
  (defcap GOVERNANCE ()
    (enforce-guard (read-keyset "free.stake-for-steak-keyset")))

  ; Schema for the stake
  (defschema stake
    ; The name of the stake
    name:string
    ; Account to credit for this stake
    merchant:string
    ; Owner of the stake
    owner:guard
    ; Amount to stake
    stake:decimal
    ; The balance of the stake
    balance:decimal)
  (deftable stake-table:{stake})

  ; Schema for the stakers
  ; Key of the table will consist of {stake-name}-{staker}
  (defschema stakers
    ; The amount staked
    amount:decimal
    guard:guard)
  (deftable stakers-table:{stakers})
)

(create-table stake-table)
(create-table stakers-table)
