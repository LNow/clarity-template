(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant DEPLOYED_AT block-height)

(define-constant ERR_NOT_AUTHORIZED (err u1001))

(impl-trait .sip-010-trait-ft-standard.sip-010-trait)

(define-constant CFG_DECIMALS u4)
(define-constant CFG_NAME "token")
(define-constant CFG_SYMBOL "TOK")
(define-map CFG_URI bool (string-utf8 256))

(define-fungible-token token)

(define-read-only (get-balance (owner principal))
  (ok (ft-get-balance token owner))
)

(define-read-only (get-decimals)
  (ok CFG_DECIMALS)
)

(define-read-only (get-name)
  (ok CFG_NAME)
)

(define-read-only (get-symbol)
  (ok CFG_SYMBOL)
)

(define-read-only (get-token-uri)
  (ok (map-get? CFG_URI true))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply token))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_NOT_AUTHORIZED)
    (match memo memoVal (print memoVal) 0x)
    (ft-transfer? token amount sender recipient)
  )
)

;; extra functions
(define-public (set-token-uri (uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq contract-caller CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ok (match uri uriVal
      (map-set CFG_URI true uriVal)
      (map-delete CFG_URI true)
    ))
  )
)

;; test functions
(define-public (test-mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq DEPLOYED_AT u0) ERR_NOT_AUTHORIZED)
    (ft-mint? token amount recipient)
  )
)
