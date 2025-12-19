// ExamCard.jsx


export function ExamCard({ exam, onViewDetails }) {
    const { examName, patientName, doctorName, status } = exam;
    const statusColor =
        status === 'Completed'
            ? 'text-green-600'
            : status === 'Pending'
                ? 'text-yellow-600'
                : 'text-red-600';

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-teal-700 mb-4">{examName}</h3>
            <div className="space-y-3">
                <p className="text-gray-700">
                    <span className="font-semibold">Patient :</span> {patientName}
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Prescrit par :</span> {doctorName}
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Status :</span>{' '}
                    <span className={statusColor}>{status}</span>
                </p>
            </div>
            <div className="mt-4 flex justify-end">
                <button
                    onClick={() => onViewDetails(exam)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors duration-300"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
