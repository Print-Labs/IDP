
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const alt = 'PandaLabs'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #0eb374, #000000)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '40px 80px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    }}
                >
                    {/* We can't easily use the local file image here without fs, so we use text/emoji or SVG */}
                    <div style={{ fontSize: 120, marginRight: 30 }}>🐼</div>
                    <div
                        style={{
                            fontSize: 100,
                            fontWeight: 'bold',
                            color: 'white',
                            letterSpacing: '-0.05em',
                        }}
                    >
                        PandaLabs
                    </div>
                </div>
                <div
                    style={{
                        marginTop: 40,
                        fontSize: 30,
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                    }}
                >
                    Advanced Campus Manufacturing
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
