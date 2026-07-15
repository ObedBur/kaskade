CREATE UNIQUE INDEX "Payment_requestId_type_active_unique_idx"
ON "Payment" ("requestId", "type")
WHERE "status" IN ('PENDING', 'SUCCESS');
