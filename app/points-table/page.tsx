/**
 * Points Table Component
 * 
 * A beautiful, responsive quiz competition points table with:
 * - 14 colorful rounds
 * - Automatic ranking with trophy badges
 * - Mobile-optimized card view
 * - Desktop scrollable table with sticky columns
 * - Real-time data from Supabase
 * - Auto-calculated totals
 * 
 * Setup: Run SUPABASE_SETUP_INSTRUCTIONS.sql in your Supabase dashboard
 * See: POINTS_TABLE_README.md for full documentation
 */

"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Award } from "lucide-react";

type PointsData = {
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
};

const roundNames = [
    { key: "fill_blanks_a", label: "Fill Blanks A", color: "bg-blue-100 dark:bg-blue-900" },
    { key: "fill_blanks_b", label: "Fill Blanks B", color: "bg-blue-200 dark:bg-blue-800" },
    { key: "one_word_a", label: "One Word A", color: "bg-green-100 dark:bg-green-900" },
    { key: "one_word_b", label: "One Word B", color: "bg-green-200 dark:bg-green-800" },
    { key: "true_false_a", label: "True/False A", color: "bg-purple-100 dark:bg-purple-900" },
    { key: "true_false_b", label: "True/False B", color: "bg-purple-200 dark:bg-purple-800" },
    { key: "who_said_to_whom", label: "Who Said", color: "bg-pink-100 dark:bg-pink-900" },
    { key: "match_column", label: "Match Column", color: "bg-orange-100 dark:bg-orange-900" },
    { key: "crossword", label: "Crossword", color: "bg-yellow-100 dark:bg-yellow-900" },
    { key: "visual_round", label: "Visual Round", color: "bg-indigo-100 dark:bg-indigo-900" },
    { key: "rapid_fire", label: "Rapid Fire", color: "bg-red-100 dark:bg-red-900" },
    { key: "diocese_round_a", label: "Diocese A", color: "bg-teal-100 dark:bg-teal-900" },
    { key: "diocese_round_b", label: "Diocese B", color: "bg-teal-200 dark:bg-teal-800" },
    { key: "complete_verse", label: "Complete Verse", color: "bg-cyan-100 dark:bg-cyan-900" },
];

export default function PointsTablePage() {
    const [data, setData] = useState<PointsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPointsData();
    }, []);

    async function fetchPointsData() {
        try {
            setLoading(true);
            const { data: pointsData, error } = await supabaseBrowser
                .from("points_table")
                .select("*")
                .order("total", { ascending: false });

            if (error) throw error;

            setData(pointsData || []);
        } catch (err: any) {
            console.error("Error fetching points data:", err);
            setError(err.message || "Failed to fetch points data");
        } finally {
            setLoading(false);
        }
    }

    const getRankBadge = (index: number) => {
        const badges = [
            { icon: Trophy, color: "bg-yellow-500 text-white", label: "1st" },
            { icon: Award, color: "bg-gray-400 text-white", label: "2nd" },
            { icon: Award, color: "bg-amber-700 text-white", label: "3rd" },
        ];

        if (index < 3) {
            const badge = badges[index];
            const Icon = badge.icon;
            return (
                <Badge className={`${badge.color} gap-1`}>
                    <Icon size={14} />
                    {badge.label}
                </Badge>
            );
        }
        return <span className="text-muted-foreground">#{index + 1}</span>;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Points Table</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center gap-2 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Quiz Competition Points Table
                        </h1>
                    </div>
                </div>

                {/* Desktop/Tablet View */}
                <Card className="hidden md:block shadow-lg">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="font-bold text-center w-20 sticky left-0 bg-muted/50 z-10">
                                            Rank
                                        </TableHead>
                                        <TableHead className="font-bold w-16 sticky left-20 bg-muted/50 z-10">
                                            Group
                                        </TableHead>
                                        <TableHead className="font-bold min-w-[200px] sticky left-36 bg-muted/50 z-10">
                                            Church Name
                                        </TableHead>
                                        {roundNames.map((round) => (
                                            <TableHead key={round.key} className="text-center font-semibold min-w-[100px]">
                                                {round.label}
                                            </TableHead>
                                        ))}
                                        <TableHead className="font-bold text-center min-w-[100px] bg-primary/10 sticky right-0 z-10">
                                            Total
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((row, index) => (
                                        <TableRow
                                            key={row.id}
                                            className={`${index < 3 ? "bg-muted/30" : ""
                                                } hover:bg-muted/50 transition-colors`}
                                        >
                                            <TableCell className="text-center font-medium sticky left-0 bg-background z-10">
                                                {getRankBadge(index)}
                                            </TableCell>
                                            <TableCell className="font-semibold sticky left-20 bg-background z-10">
                                                {row.group_no}
                                            </TableCell>
                                            <TableCell className="font-medium sticky left-36 bg-background z-10">
                                                {row.church_name}
                                            </TableCell>
                                            {roundNames.map((round) => (
                                                <TableCell
                                                    key={round.key}
                                                    className={`text-center ${round.color} font-medium`}
                                                >
                                                    {row[round.key as keyof PointsData]}
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-center font-bold text-lg bg-primary/10 sticky right-0 z-10">
                                                {row.total}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {data.map((row, index) => (
                        <Card
                            key={row.id}
                            className={`${index < 3 ? "border-primary shadow-lg" : "shadow-md"
                                } overflow-hidden`}
                        >
                            <CardHeader className="pb-3 bg-muted/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getRankBadge(index)}
                                            <Badge variant="outline">Group {row.group_no}</Badge>
                                        </div>
                                        <CardTitle className="text-xl">{row.church_name}</CardTitle>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Total Points</div>
                                        <div className="text-3xl font-bold text-primary">{row.total}</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {roundNames.map((round) => (
                                        <div
                                            key={round.key}
                                            className={`${round.color} rounded-lg p-3 text-center`}
                                        >
                                            <div className="text-xs font-medium text-muted-foreground mb-1">
                                                {round.label}
                                            </div>
                                            <div className="text-lg font-bold">
                                                {row[round.key as keyof PointsData]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Footer Stats */}
                {/* {data.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-muted-foreground">Total Churches</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{data.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-muted-foreground">Highest Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-primary">{data[0]?.total || 0}</p>
                                <p className="text-sm text-muted-foreground mt-1">{data[0]?.church_name}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-muted-foreground">Total Rounds</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">14</p>
                            </CardContent>
                        </Card>
                    </div>
                )} */}
            </div>
        </div>
    );
}
