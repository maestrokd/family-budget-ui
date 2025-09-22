import React from 'react'
import {ModeToggle} from "@/components/theme/mode-toggle.tsx";

const SettingsPage: React.FC = () => (

    <div className="flex items-center justify-center h-full p-6">
        <ModeToggle/>
      <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
    </div>
)

export default SettingsPage
