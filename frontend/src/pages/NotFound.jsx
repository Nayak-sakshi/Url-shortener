import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <section className="auth">
            <h1>Page not found</h1>
            <p>
                This address doesn't match a page. <Link to="/">Shorten a link</Link>{" "}
                instead.
            </p>
        </section>
    );
}
