
import React from 'react';

interface FooterProps {
  width?: string;
  height?: string;
}

const Footer = ({ width = '100%', height = '100%' }: FooterProps) => {
    return (
        <div style={{ height: height, width: width, borderTop: '1px solid #ccc', color: 'black', textAlign: 'left', paddingLeft: '0.5rem' }}>
            2025 Polyboard
        </div>
    );
};

export default Footer;