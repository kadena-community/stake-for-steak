(namespace 'free)

(define-keyset "free.stake-for-steak-keyset" (read-keyset 'stake-for-steak-keyset))

(module stake-for-steak GOVERNANCE
  (defcap GOVERNANCE ()
    (enforce-guard (read-keyset "free.stake-for-steak-keyset")))

  ; Schema for the stake
  (defschema stake
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
  (deftable stake-table:{stake})

  ; Schema for the stakers
  ; Key of the table will consist of {stake-name}-{staker}
  (defschema stakers
    ; The amount staked
    amount:decimal
    guard:guard)
  (deftable stakers-table:{stakers})

  (defun create-stake(name:string
                      merchant:string
                      owner:string
                      owner-guard:guard
                      stake:decimal)
    (insert stake-table name {
      "merchant"    : merchant,
      "owner"       : owner,
      "owner-guard" : owner-guard,
      "stake"       : stake,
      "balance"     : 0.0
    }))
  
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
)

(create-table stake-table)
(create-table stakers-table)
