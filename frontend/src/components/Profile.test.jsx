import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Profile from './Profile';
describe('Profile', () => { it('shows account details and closes on request', () => { const onClose = vi.fn(); render(<Profile user={{ name: 'Asha Kumar', email: 'asha@example.com' }} onClose={onClose} />); expect(screen.getByRole('dialog', { name: /your profile/i })).toHaveTextContent('Asha Kumar'); expect(screen.getByRole('dialog')).toHaveTextContent('asha@example.com'); fireEvent.click(screen.getByRole('button', { name: /close profile/i })); expect(onClose).toHaveBeenCalledOnce(); }); });
