-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicianProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL DEFAULT 'ALL',
    "bio" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicianProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL DEFAULT 'BOTH',
    "description" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "serviceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "technicianId" TEXT,
    "serviceTypeId" TEXT,
    "deviceType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT,
    "complaint" TEXT NOT NULL,
    "initialCondition" TEXT NOT NULL,
    "devicePhotoUrl" TEXT,
    "handoverMethod" TEXT NOT NULL DEFAULT 'DROP_OFF',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "estimatedCost" INTEGER,
    "finalCost" INTEGER,
    "estimatedCompletion" TIMESTAMP(3),
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailedFindings" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostEstimate" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "estimatedAmount" INTEGER NOT NULL,
    "breakdown" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "customerNotes" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairLog" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "partsReplaced" TEXT,
    "notes" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "actorId" TEXT,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "receiptNumber" TEXT,
    "amount" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "proofUrl" TEXT,
    "proofFileName" TEXT,
    "referenceNumber" TEXT,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "recordedById" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePaymentSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'ServisKu Workshop',
    "storeAddress" TEXT NOT NULL DEFAULT 'Jl. Sudirman No. 45, Jakarta Pusat',
    "storePhone" TEXT NOT NULL DEFAULT '0812-3456-7890',
    "storeEmail" TEXT NOT NULL DEFAULT 'layanan@servisku.com',
    "bankName" TEXT NOT NULL DEFAULT 'Bank Mandiri',
    "bankAccountNumber" TEXT NOT NULL DEFAULT '1440028395116',
    "bankAccountHolder" TEXT NOT NULL DEFAULT 'ALIF NOOR RAHMAN HAMID',
    "qrisMerchantName" TEXT NOT NULL DEFAULT 'ServisKu / ALIF NOOR RAHMAN HAMID',
    "qrisImageUrl" TEXT NOT NULL DEFAULT '/images/qris-merchant.png',
    "warrantyTerms" TEXT NOT NULL DEFAULT 'Garansi servis & suku cadang berlaku 30 - 90 hari sesuai jenis tindakan. Harap simpan struk ini sebagai bukti klaim garansi resmi.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorePaymentSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicianProfile_userId_key" ON "TechnicianProfile"("userId");

-- CreateIndex
CREATE INDEX "ServiceType_deviceType_idx" ON "ServiceType"("deviceType");

-- CreateIndex
CREATE INDEX "ServiceType_isActive_idx" ON "ServiceType"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_serviceNumber_key" ON "ServiceRequest"("serviceNumber");

-- CreateIndex
CREATE INDEX "ServiceRequest_customerId_idx" ON "ServiceRequest"("customerId");

-- CreateIndex
CREATE INDEX "ServiceRequest_technicianId_idx" ON "ServiceRequest"("technicianId");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");

-- CreateIndex
CREATE INDEX "ServiceRequest_createdAt_idx" ON "ServiceRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_serviceRequestId_key" ON "Diagnosis"("serviceRequestId");

-- CreateIndex
CREATE INDEX "CostEstimate_serviceRequestId_idx" ON "CostEstimate"("serviceRequestId");

-- CreateIndex
CREATE INDEX "RepairLog_serviceRequestId_idx" ON "RepairLog"("serviceRequestId");

-- CreateIndex
CREATE INDEX "StatusHistory_serviceRequestId_idx" ON "StatusHistory"("serviceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceNumber_key" ON "Payment"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receiptNumber_key" ON "Payment"("receiptNumber");

-- CreateIndex
CREATE INDEX "Payment_serviceRequestId_idx" ON "Payment"("serviceRequestId");

-- CreateIndex
CREATE INDEX "Payment_paymentStatus_idx" ON "Payment"("paymentStatus");

-- CreateIndex
CREATE INDEX "Payment_receiptNumber_idx" ON "Payment"("receiptNumber");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "TechnicianProfile" ADD CONSTRAINT "TechnicianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostEstimate" ADD CONSTRAINT "CostEstimate_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairLog" ADD CONSTRAINT "RepairLog_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
