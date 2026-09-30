import { useCallback, useState } from "react";

import { deleteUrl } from "../api/url.api";
import { useSubmit } from "../hooks/useSubmit";

export default function DeleteLink({ linkId, onDeleted }) {
    const [confirming, setConfirming] = useState(false);

    const remove = useCallback(async () => {
        await deleteUrl(linkId);
        return true;
    }, [linkId]);

    const { submit, pending, error } = useSubmit(remove);

    const handleDelete = async () => {
        if (await submit()) {
            onDeleted?.();
        }
    };

    if (!confirming) {
        return (
            <button
                type="button"
                className="btn btn-danger-outline"
                onClick={() => setConfirming(true)}
            >
                Delete link
            </button>
        );
    }

    return (
        <div className="confirm" role="group" aria-label="Confirm delete">
            <p>The short link stops working right away and can't be restored.</p>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            <div className="form-actions">
                <button
                    type="button"
                    className="btn btn-danger"
                    disabled={pending}
                    onClick={handleDelete}
                >
                    {pending ? "Deleting…" : "Delete link"}
                </button>
                <button
                    type="button"
                    className="btn btn-quiet"
                    disabled={pending}
                    onClick={() => setConfirming(false)}
                >
                    Keep link
                </button>
            </div>
        </div>
    );
}
