"use client";

import { useState, useMemo, type ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Category = {
  id: number;
  name: string;
  weight: string;
  score: string;
};

export default function GradeCalculatorPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: Date.now(), name: '', weight: '', score: '' }
  ]);
  const [finalGrade, setFinalGrade] = useState<number | null>(null);
  const { toast } = useToast();

  const totalWeight = useMemo(() => {
    return categories.reduce((acc, cat) => acc + (parseFloat(cat.weight) || 0), 0);
  }, [categories]);

  const handleAddCategory = () => {
    setCategories([...categories, { id: Date.now(), name: '', weight: '', score: '' }]);
  };

  const handleRemoveCategory = (id: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter(cat => cat.id !== id));
    } else {
      toast({
        variant: "destructive",
        title: "Action Forbidden",
        description: "You must have at least one category.",
      });
    }
  };

  const handleCategoryChange = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategories(categories.map(cat => (cat.id === id ? { ...cat, [name]: value } : cat)));
  };

  const handleCalculate = () => {
    if (totalWeight !== 100) {
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: `Total weight must be exactly 100%. Current total: ${totalWeight}%`,
      });
      setFinalGrade(null);
      return;
    }
    
    // Check for invalid scores or weights
    for (const cat of categories) {
      const weight = parseFloat(cat.weight);
      const score = parseFloat(cat.score);
      if (isNaN(weight) || isNaN(score) || weight < 0 || score < 0 || score > 100) {
        toast({
          variant: "destructive",
          title: "Invalid Input",
          description: `Please check your values for "${cat.name || 'a category'}". Weights and scores must be positive numbers, and scores cannot exceed 100.`,
        });
        setFinalGrade(null);
        return;
      }
    }

    const grade = categories.reduce((acc, cat) => {
      const weight = parseFloat(cat.weight) || 0;
      const score = parseFloat(cat.score) || 0;
      return acc + (weight / 100) * score;
    }, 0);

    setFinalGrade(grade);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 font-body transition-colors duration-300">
      <div className="w-full max-w-3xl space-y-8">
        <Card className="shadow-2xl shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Grade Ace</CardTitle>
            <CardDescription className="pt-2">A minimal, single-session tool to calculate your course grade.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            <div className="grid grid-cols-[1fr,auto,auto,auto] gap-2 text-sm font-medium text-muted-foreground px-2">
              <span>Category Name</span>
              <span className="text-center">Weight (%)</span>
              <span className="text-center">My Score (%)</span>
              <span />
            </div>
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={category.id} className="grid grid-cols-[1fr,100px,100px,auto] items-center gap-2 animate-in fade-in-0 slide-in-from-top-4 duration-500">
                  <Input
                    name="name"
                    value={category.name}
                    onChange={(e) => handleCategoryChange(category.id, e)}
                    placeholder={`e.g., Homework`}
                    aria-label="Category Name"
                  />
                  <Input
                    type="number"
                    name="weight"
                    value={category.weight}
                    onChange={(e) => handleCategoryChange(category.id, e)}
                    placeholder="e.g., 20"
                    aria-label="Weight"
                    className="text-center"
                    min="0"
                  />
                  <Input
                    type="number"
                    name="score"
                    value={category.score}
                    onChange={(e) => handleCategoryChange(category.id, e)}
                    placeholder="e.g., 95"
                    aria-label="Score"
                    className="text-center"
                    min="0"
                    max="100"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveCategory(category.id)} aria-label="Remove Category">
                    <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full border-dashed" onClick={handleAddCategory}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col-reverse items-center gap-4 rounded-b-lg bg-muted/50 p-4 sm:flex-row sm:justify-between">
            <div className="text-sm">
              Total Weight: <span className={`font-bold transition-colors ${totalWeight === 100 ? 'text-green-600' : 'text-destructive'}`}>{totalWeight.toFixed(2)}%</span>
            </div>
            <Button onClick={handleCalculate} size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground shadow-md transition-transform hover:scale-105 hover:bg-accent/90 active:scale-100">
              Calculate Final Grade
            </Button>
          </CardFooter>
        </Card>

        {finalGrade !== null && (
          <div className="animate-in fade-in-0 zoom-in-95 duration-500">
            <Card className="bg-gradient-to-br from-accent to-primary shadow-2xl shadow-accent/20">
              <CardHeader>
                <CardTitle className="text-center text-xl font-bold text-accent-foreground font-headline">Your Calculated Final Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-7xl font-bold text-accent-foreground">{finalGrade.toFixed(2)}%</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
