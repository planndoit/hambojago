export type CreatorAccount = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export type CreatorSession = {
  id: string;
  creator_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
};

export type Event = {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export type EventDate = {
  id: string;
  event_id: string;
  date: string;
  created_at: string;
};

export type Participant = {
  id: string;
  event_id: string;
  name: string;
  pin_hash: string;
  edit_token_hash: string;
  created_at: string;
  updated_at: string;
};

export type Availability = {
  id: string;
  event_id: string;
  participant_id: string;
  date: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      creator_accounts: {
        Row: CreatorAccount;
        Insert: Omit<CreatorAccount, "id" | "created_at" | "updated_at"> &
          Partial<Pick<CreatorAccount, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<CreatorAccount, "id" | "created_at">>;
        Relationships: [];
      };
      creator_sessions: {
        Row: CreatorSession;
        Insert: Omit<CreatorSession, "id" | "created_at"> &
          Partial<Pick<CreatorSession, "id" | "created_at">>;
        Update: Partial<Omit<CreatorSession, "id" | "created_at">>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Event, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Event, "id" | "created_at">>;
        Relationships: [];
      };
      event_dates: {
        Row: EventDate;
        Insert: Omit<EventDate, "id" | "created_at"> &
          Partial<Pick<EventDate, "id" | "created_at">>;
        Update: Partial<Omit<EventDate, "id" | "created_at">>;
        Relationships: [];
      };
      participants: {
        Row: Participant;
        Insert: Omit<Participant, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Participant, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Participant, "id" | "created_at">>;
        Relationships: [];
      };
      availability: {
        Row: Availability;
        Insert: Omit<Availability, "id" | "created_at"> &
          Partial<Pick<Availability, "id" | "created_at">>;
        Update: Partial<Omit<Availability, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type EventWithDates = Event & {
  event_dates: EventDate[];
};

export type EventResult = {
  date: string;
  count: number;
  participants: string[];
};

export type CreatorEventSummary = {
  event: Event;
  participantCount: number;
  bestDate: string | null;
  bestDateCount: number;
};
