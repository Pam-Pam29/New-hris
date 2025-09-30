import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../../../components/ui/dialog';
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";

import { Policy } from '../types';

interface PolicyDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy | null;
  /** Called when Publish is clicked (policy id is passed) */
  onPublish?: (policyId: number) => void;
  /** If true, disables the Publish button and shows loading */
  sending?: boolean;
}

export const PolicyDetailsDrawer: React.FC<PolicyDetailsDrawerProps> = ({ open, onOpenChange, policy, onPublish, sending }) => {
  if (!policy) return null;

  const statusColors: Record<string, string> = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Under Review': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Published': 'bg-green-100 text-green-800',
    'Archived': 'bg-red-100 text-red-800',
  };

  const acknowledgmentRate = policy.totalEmployees > 0 ? Math.round((policy.acknowledgmentCount / policy.totalEmployees) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full min-h-[60vh] mx-auto p-10 bg-background rounded-2xl shadow-2xl border border-border flex flex-col">
        {/* Article-style Header */}
        <header className="mb-6 border-b pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            {policy.title}
            <Badge className={statusColors[policy.status]}>{policy.status}</Badge>
          </h1>
          <div className="mt-2 flex flex-wrap gap-6 text-base text-muted-foreground">
            <span>Category: <span className="font-medium text-foreground">{policy.category}</span></span>
            <span>Version: <span className="font-medium text-foreground">{policy.version}</span></span>
            <span>Created: <span className="font-medium text-foreground">{policy.createdDate}</span></span>
            <span>Last Modified: <span className="font-medium text-foreground">{policy.lastModified}</span></span>
            {policy.effectiveDate && <span>Effective: <span className="font-medium text-foreground">{policy.effectiveDate}</span></span>}
            {policy.expiryDate && <span>Expires: <span className="font-medium text-foreground">{policy.expiryDate}</span></span>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-10">
          {/* Main Policy Content as Article */}
          <section className="prose prose-lg max-w-none bg-white p-8 rounded-lg border border-muted shadow font-serif">
            <div dangerouslySetInnerHTML={{ __html: policy.description }} />
          </section>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mt-2">
            {policy.tags && policy.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>

          {/* Meta Footer */}
          <footer className="flex flex-wrap gap-8 mt-4 text-base border-t pt-6 text-muted-foreground">
            <span>Acknowledgment: <span className="font-medium text-foreground">{policy.acknowledgmentRequired ? `${policy.acknowledgmentCount}/${policy.totalEmployees} (${acknowledgmentRate}%)` : 'Not required'}</span></span>
            {policy.approvedBy && <span>Approved By: <span className="font-medium text-foreground">{policy.approvedBy}</span></span>}
            {policy.approvedDate && <span>Approved Date: <span className="font-medium text-foreground">{policy.approvedDate}</span></span>}
            {policy.publishedDate && <span>Published: <span className="font-medium text-foreground">{policy.publishedDate}</span></span>}
          </footer>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          {(policy.status === 'Draft' || policy.status === 'Under Review') && (
            <Button
              variant="default"
              className="px-6 py-2 text-lg bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onPublish?.(policy.id)}
              disabled={sending}
            >
              {sending ? 'Publishing...' : 'Publish'}
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline" className="px-6 py-2 text-lg">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
