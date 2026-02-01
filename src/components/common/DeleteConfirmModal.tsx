import React from "react";

interface DeleteConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    open,
    onClose,
    onConfirm,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-sm p-6">

                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    Are you sure?
                </h2>

                <p className="text-gray-600 mb-6">
                    Do you really want to delete this item? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
