import { useCallback, useEffect, useState } from "react";

// Runs an async loader on mount and whenever deps change.
export function useAsync(loader, deps = []) {
    const [state, setState] = useState({
        data: null,
        error: null,
        loading: true
    });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;

        setState((current) => ({ ...current, error: null, loading: true }));

        loader()
            .then((data) => {
                if (active) {
                    setState({ data, error: null, loading: false });
                }
            })
            .catch((error) => {
                if (active) {
                    setState({ data: null, error, loading: false });
                }
            });

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, reloadKey]);

    const reload = useCallback(() => setReloadKey((key) => key + 1), []);

    return { ...state, reload };
}
