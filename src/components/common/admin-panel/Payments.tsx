'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers } from '@/store/thunks/userThunks';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Payments() {
  const dispatch = useAppDispatch();
  const { users, status, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers()); // Fetch users
  }, [dispatch]);

  if (status === 'loading') {
    return <div className="container mx-auto">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="container mx-auto">Error: {error}</div>;
  }

  if (users.length !== 0) {
    return (
      <div className="container mx-auto">
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">INV00{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
