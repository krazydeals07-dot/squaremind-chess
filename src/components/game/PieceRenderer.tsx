
import { memo } from 'react';

const pieceComponents: { [key: string]: string } = {
    wK: '♚', wQ: '♛', wR: '♜', wB: '♝', wN: '♞', wP: '♟︎',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟︎'
};

const PieceRendererComponent = memo(({ piece, color, isBlack = false, squareWidth }: { piece: string, color: string, isBlack?: boolean, squareWidth: number }) => (
    <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: squareWidth * 0.75, color: color, textShadow: isBlack ? '-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF, -2px -2px 5px rgba(0,0,0,0.3)' : '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{piece}</div>
));
PieceRendererComponent.displayName = 'PieceRenderer';

const PieceRenderer = {
    wK: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.wK} color="#FFFFFF" />,
    wQ: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.wQ} color="#FFFFFF" />,
    wR: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.wR} color="#FFFFFF" />,
    wB: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.wB} color="#FFFFFF" />,
    wN: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.wN} color="#FFFFFF" />,
    wP: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.wP} color="#FFFFFF" />,
    bK: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.bK} color="#1A1A1A" isBlack />,
    bQ: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.bQ} color="#1A1A1A" isBlack />,
    bR: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.bR} color="#1A1A1A" isBlack />,
    bB: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.bB} color="#1A1A1A" isBlack />,
    bN: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.bN} color="#1A1A1A" isBlack />,
    bP: (p: any) => <PieceRendererComponent {...p} piece={pieceComponents.bP} color="#1A1A1A" isBlack />
};

export default PieceRenderer;
