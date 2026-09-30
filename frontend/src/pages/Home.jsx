import { useState } from "react";
import { Link } from "react-router-dom";

import ShortenForm from "../components/ShortenForm";
import ShortLinkResult from "../components/ShortLinkResult";
import { useAuth } from "../context/AuthContext";

export default function Home() {
    const { user } = useAuth();
    const [created, setCreated] = useState(null);

    return (
        <div className="home">
            <section className="hero">
                <h1 className="headline">Make a long link short.</h1>

                <p className="lede">
                    Paste any web address and get a short one to share.
                    {user
                        ? " It's saved to your links, where you can see its clicks."
                        : " Log in first if you want to keep it and see its clicks."}
                </p>

                <ShortenForm size="large" onCreated={setCreated} />
            </section>

            {created && (
                <ShortLinkResult link={created}>
                    <p className="result-note">
                        {user ? (
                            <>
                                Saved to <Link to="/dashboard">your links</Link>.
                            </>
                        ) : (
                            <>
                                This link isn't tied to an account.{" "}
                                <Link to="/register">Create an account</Link> to manage
                                the next ones.
                            </>
                        )}
                    </p>
                </ShortLinkResult>
            )}
        </div>
    );
}
