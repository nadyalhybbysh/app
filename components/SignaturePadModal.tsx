import React from 'react';
import { PenTool, X, Check } from 'lucide-react';

interface SignaturePadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureData: string) => void;
    title: string;
}

const SignaturePadModal: React.FC<SignaturePadModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    title 
}) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);

    React.useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const rect = canvas.parentElement?.getBoundingClientRect();
                if (rect) {
                    canvas.width = rect.width;
                    canvas.height = 200;
                }
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000000';
            }
        }
    }, [isOpen]);

    const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if ('touches' in event) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = (event as React.MouseEvent).clientX;
            clientY = (event as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const endDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.closePath();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL('image/png');
            onSave(dataUrl);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <PenTool size={18} /> {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-4 bg-white relative">
                   <p className="text-xs text-gray-400 mb-2 text-center">قم بالتوقيع في المربع أدناه</p>
                   <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 touch-none">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-[200px] cursor-crosshair touch-none"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={endDrawing}
                            onMouseLeave={endDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={endDrawing}
                        />
                   </div>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-between gap-3">
                    <button 
                        onClick={clearCanvas}
                        className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                    >
                        مسح التوقيع
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Check size={16} /> اعتماد
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignaturePadModal;