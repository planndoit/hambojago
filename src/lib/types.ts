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
