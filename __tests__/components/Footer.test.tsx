import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer Component', () => {
  it('renders correctly', () => {
    render(<Footer />);
    // Check if brand name is rendered
    expect(screen.getByText('XMP Store')).toBeInTheDocument();
    
    // Check if expected section headers are there
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();

    // Check copyright
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
