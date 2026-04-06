import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DeletedCommunity = () => {
	const { t } = useTranslation();

    return (
        <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur">
            <h1 className="text-2xl font-black">{t("community.deleted.title")}</h1>
            <p className="mt-2 text-sm text-white/70">
                {t("community.deleted.description")}
            </p>
            <Link to="/communities" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                {t("community.deleted.back_button")}
            </Link>
        </section>
    );
};

export default DeletedCommunity;