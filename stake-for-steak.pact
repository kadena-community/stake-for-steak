(namespace 'free)

(define-keyset "free.stake-for-steak-keyset" (read-keyset 'stake-for-steak-keyset))

(module stake-for-steak GOVERNANCE
  (defcap GOVERNANCE ()
    (enforce-guard (read-keyset "free.stake-for-steak-keyset")))

  (use coin)

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
    amount:decimal)
  (deftable stakers-table:{stakers})

  (defun stake-guard:bool (owner-guard:guard)
    ; (enforce-keyset (read-keyset "free.stake-for-steak-keyset"))
    (enforce-guard owner-guard))

  (defun create-stake(name:string
                      merchant:string
                      owner:string
                      owner-guard:guard
                      stake:decimal)
    (let ((stake-escrow (format "{}-{}" [owner name])))
      (create-account stake-escrow (create-user-guard (stake-guard owner-guard)))
      (transfer owner stake-escrow stake)
      (insert stake-table name {
        "merchant"    : merchant,
        "owner"       : owner,
        "owner-guard" : owner-guard,
        "stake"       : stake,
        "balance"     : stake
      })))
  
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

  (defun fund-stake(name:string staker:string)
    (with-read stake-table name
      { "owner"       := owner
      , "stake"       := stake
      , "balance"     := balance }
      (let ((stake-escrow (format "{}-{}" [owner name])))
        (coin.transfer staker stake-escrow stake)
        (update stake-table name 
          { "balance" : (+ balance stake) })
        (insert stakers-table (format "{}-{}" [staker name]) {
          "amount" : stake
        }))))
)

(create-table stake-table)
(create-table stakers-table)
