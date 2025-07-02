import { render, screen } from '@/test/utils/renderWithIntl';
import DotsIndicator from './DotsIndicator';

describe('DotsIndicator', () => {
  it('renders no dots if length is 0', () => {
    render(<DotsIndicator length={0} currentIndex={0} />);
    expect(screen.queryAllByTestId('dot')).toHaveLength(0);
  });

  it('renders correct number of dots', () => {
    render(<DotsIndicator length={5} currentIndex={2} />);
    expect(screen.getAllByTestId('dot')).toHaveLength(5);
  });

  it('highlights the current index dot', () => {
    render(<DotsIndicator length={4} currentIndex={1} />);
    const dots = screen.getAllByTestId('dot');
    dots.forEach((dot, index) => {
      if (index === 1) {
        expect(dot.className).toMatch(/bg-primary/);
        expect(dot.className).toMatch(/w-4/);
      } else {
        expect(dot.className).not.toMatch(/bg-primary/);
        expect(dot.className).not.toMatch(/w-4/);
      }
    });
  });
});
