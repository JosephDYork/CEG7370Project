import React from 'react';

interface HeaderProps {
  width?: string;
  height?: string;
}

const Header = ({ width = '100%', height = '100%' }: HeaderProps) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'stretch',
                backgroundColor: 'white',
                height: height,
                width: width,
                justifyContent: 'space-between',
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: 'auto',
                flex: "1 1 0px"
            }}>
                <img
                    src="/polyboard.svg"
                    alt="Polyboard"
                    style={{
                        height: '5rem',
                        width: 'auto'
                    }}
                />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 'auto',
                flex: "1 1 0px"
            }}>
                <select 
                    style={{
                        height: '2.5rem',
                        width: '100%',
                        maxWidth: '8rem',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '0.9rem',
                        backgroundColor: 'white',
                        color: '#495057',
                    }}
                >
                    <option value="workspace1">English</option>
                    <option value="workspace2">Spanish</option>
                </select>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                paddingRight: '0.5rem',
                flex: "1 1 0px",
                margin: 'auto',
            }}>
                <button style={{
                    backgroundColor: '#f8f9fa',
                    color: '#495057',
                    border: '1px solid #dee2e6',
                    borderRadius: '10px',
                    padding: '0.8rem 1.3rem',
                    fontSize: '0.9rem',
                }}>
                    Clear Canvas
                </button>
                <button style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: '1px solid #28a745',
                    borderRadius: '10px',
                    padding: '0.8rem 1.3rem',
                    fontSize: '0.9rem',
                }}>
                    Save
                </button>
                <button style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: '1px solid #007bff',
                    borderRadius: '10px',
                    padding: '0.8rem 1.3rem',
                    fontSize: '0.9rem',
                }}>
                    Export PDF
                </button>
            </div>
        </div>
    );
};

export default Header;