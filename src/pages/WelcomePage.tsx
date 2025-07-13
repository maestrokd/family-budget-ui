import React from 'react'
import {useTranslation} from "react-i18next";

const WelcomePage: React.FC = () => {
    const {t} = useTranslation();

    return (
        <div className="flex items-center justify-center h-full p-6">
            <h2 className="text-2xl font-semibold text-gray-800">{t('dashboard.welcome')}</h2>
        </div>
    )
}

export default WelcomePage
