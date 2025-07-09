import { describe, it, expect } from 'vitest';
import { screen, render, waitFor } from '@/test/utils/renderWithIntl';
import LocaleLoading from '../loading';

describe('LocaleLoading', () => {
  it('renders the spinner and localized loading message', () => {
    render(<LocaleLoading />);

    waitFor(() => {
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toHaveClass('animate-spin');

      const loadingText = screen.getByText('Loading…');
      expect(loadingText).toBeInTheDocument();
      expect(loadingText).toHaveClass('animate-pulse', 'text-lg', 'text-muted-foreground');
    });
  });

  it('renders inside a vertical centered flex container', () => {
    const { container } = render(<LocaleLoading />);
    const root = container.firstChild as HTMLElement;

    expect(root).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'justify-center'
    );
    expect(root.className).toMatch(/min-h-\[60vh\]/);
  });
});
