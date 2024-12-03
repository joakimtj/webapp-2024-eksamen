interface ErrorProps {
    message: string;
}

export default function Error(props: ErrorProps) {
    return (
        <div className="flex items-center justify-center min-h-[200px] bg-red-50 rounded-lg">
            <div className="text-lg font-medium text-red-600">{props.message}</div>
        </div>
    );
}