// Type definitions for Points Table
// This file provides type safety for the points table data structure

export type PointsTableRow = {
    id: string;
    group_no: number;
    church_name: string;
    fill_blanks_a: number;
    fill_blanks_b: number;
    one_word_a: number;
    one_word_b: number;
    true_false_a: number;
    true_false_b: number;
    who_said_to_whom: number;
    match_column: number;
    crossword: number;
    visual_round: number;
    rapid_fire: number;
    diocese_round_a: number;
    diocese_round_b: number;
    complete_verse: number;
    total: number;
    created_at: string;
    updated_at: string;
};

export type RoundInfo = {
    key: keyof Omit<PointsTableRow, 'id' | 'group_no' | 'church_name' | 'total' | 'created_at' | 'updated_at'>;
    label: string;
    color: string;
    maxScore?: number;
};

export type PointsTableStats = {
    totalChurches: number;
    highestScore: number;
    topChurch: string;
    totalRounds: number;
    averageScore: number;
};

// Database insert type (without auto-generated fields)
export type PointsTableInsert = Omit<PointsTableRow, 'id' | 'total' | 'created_at' | 'updated_at'>;

// Database update type (partial, without auto-generated fields)
export type PointsTableUpdate = Partial<Omit<PointsTableRow, 'id' | 'total' | 'created_at' | 'updated_at'>>;

// Supabase response type
export type SupabaseResponse<T> = {
    data: T | null;
    error: Error | null;
};
