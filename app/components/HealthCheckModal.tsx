import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HealthCheckModal({ open, onOpenChange, onSubmit }) {
  const [domain, setDomain] = useState('');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>System Health Check</DialogTitle>
          <DialogDescription>Masukkan domain, tekan Enter atau klik Run.</DialogDescription>
        </DialogHeader>
        <form
          className="flex gap-2 items-center"
          onSubmit={e => {
            e.preventDefault();
            onSubmit(domain);
          }}
        >
          <Input
            type="text"
            placeholder="Domain (e.g., google.co.id)"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            autoFocus
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit(domain);
              }
            }}
          />
          <Button type="submit">Run</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}