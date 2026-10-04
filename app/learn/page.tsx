'use client';

import { useState } from 'react';
import { FINANCIAL_TERMS, FinancialTermDefinition } from '@/lib/finance/terms';
import { FinanceTermDialog } from '@/components/finance/finance-term-dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Search, BookOpen, Lightbulb } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Terms' },
  { id: 'valuation', label: 'Valuation' },
  { id: 'price', label: 'Price & Movement' },
  { id: 'technical', label: 'Technical Indicators' },
  { id: 'fundamentals', label: 'Fundamentals' },
  { id: 'market_structure', label: 'Market Structure' },
];

export default function LearnPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState<FinancialTermDefinition | null>(null);

  const termList = Object.values(FINANCIAL_TERMS);

  const filteredTerms = termList.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortDefinition.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Market Glossary & Learning Center</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Master financial and stock market concepts with plain-language explanations, real-world examples, and actionable insights.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3 bg-card/40 p-4 rounded-xl border">
        <div className="relative max-w-md">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" aria-hidden="true" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search financial terms, e.g. P/E, RSI, LTP..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="text-xs h-7"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTerms.map((term) => (
          <Card
            key={term.id}
            className="bg-card/70 hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between group"
            onClick={() => setSelectedTerm(term)}
          >
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Badge variant="outline" className="text-[10px] capitalize font-mono">
                  {term.category.replace('_', ' ')}
                </Badge>
                <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
              </div>
              <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                {term.term}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {term.shortDefinition}
              </p>

              <div className="pt-2 border-t text-[11px] text-muted-foreground flex items-center gap-1 font-medium text-primary">
                <Lightbulb className="h-3 w-3" aria-hidden="true" />
                <span>Click to read full explanation & example</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Term Detail Dialog */}
      {selectedTerm && (
        <FinanceTermDialog
          term={selectedTerm}
          isOpen={!!selectedTerm}
          onOpenChange={(open) => !open && setSelectedTerm(null)}
        />
      )}
    </div>
  );
}
