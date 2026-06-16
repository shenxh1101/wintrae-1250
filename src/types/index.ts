export type ShowStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'archived';

export type MaterialStatus = 'not_started' | 'in_production' | 'shipped' | 'delivered';

export type PersonnelType = 'cast' | 'crew';

export type EquipmentCategory = 'lighting' | 'sound' | 'stage' | 'video' | 'other';

export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export type Role = 'coordinator' | 'venue_contact' | 'tech_lead';

export type MaterialCategory = 'poster' | 'ticket' | 'flyer' | 'merchandise' | 'other';

export interface Show {
  id: string;
  city: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  loadInTime: string;
  rehearsalTime: string;
  loadOutTime: string;
  status: ShowStatus;
  ticketTotal: number;
  ticketPriceVip: number;
  ticketPriceStandard: number;
  venueAddress?: string;
  venueContact?: string;
  venuePhone?: string;
  notes?: string;
}

export interface Personnel {
  id: string;
  showId: string;
  name: string;
  role: string;
  phone: string;
  type: PersonnelType;
  avatar?: string;
}

export interface Equipment {
  id: string;
  showId: string;
  name: string;
  quantity: number;
  category: EquipmentCategory;
  note?: string;
  providedBy?: 'venue' | 'tour' | 'rental';
}

export interface MaterialItem {
  id: string;
  showId: string;
  name: string;
  category: MaterialCategory;
  status: MaterialStatus;
  trackingNumber?: string;
  shippedDate?: string;
  quantity?: number;
  receiver?: string;
  receiverPhone?: string;
  updatedAt: string;
}

export interface Communication {
  id: string;
  showId: string;
  author: string;
  role: Role;
  time: string;
  content: string;
  topic: string;
}

export interface Issue {
  id: string;
  showId: string;
  title: string;
  assignee: string;
  status: IssueStatus;
  dueDate: string;
  isKeyReminder: boolean;
  description?: string;
  createdAt: string;
}

export interface VenuePhoto {
  id: string;
  showId: string;
  url: string;
  description: string;
  uploadedAt: string;
}

export interface Settlement {
  id: string;
  showId: string;
  actualBoxOffice: number;
  guaranteeFee: number;
  shareRatio: number;
  settlementDate?: string;
  summary?: string;
  isArchived: boolean;
  ticketSoldVip?: number;
  ticketSoldStandard?: number;
  expenses?: number;
}

export interface ReminderItem {
  id: string;
  showId: string;
  title: string;
  type: 'load_in' | 'material' | 'settlement' | 'custom';
  dueDate: string;
  isUrgent: boolean;
}
