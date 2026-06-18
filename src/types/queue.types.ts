import { TokenStatus, TokenType, QueueStatus } from "@prisma/client";

export interface TokenStatusData {
  tokenId: string;
  tokenNumber: number;
  status: TokenStatus;
  type: TokenType;
  patientName?: string | null;
  patientPhone?: string | null;
  doctorName: string;
  speciality: string;
  clinicName: string;
  clinicAddress: string;
  clinicCity: string;
  patientsAhead: number;
  currentTokenNumber: number;
}

export interface ActiveQueueData {
  queueId: string;
  doctorId: string;
  doctorName: string;
  speciality: string;
  date: Date;
  status: QueueStatus;
  currentToken: number;
  totalTokens: number;
  dailyLimit: number;
}
