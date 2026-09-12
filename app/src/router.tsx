import { createBrowserRouter } from 'react-router-dom'
import AppShell from './components/AppShell'
import S1Home from './screens/S1Home'
import CGCamera from './screens/CGCamera'
import S6ResultAction from './screens/S6ResultAction'
import SNMNoMatch from './screens/SNMNoMatch'
import DS1DiseaseDetail from './screens/DS1DiseaseDetail'
import KD1KrishiDirectory from './screens/KD1KrishiDirectory'
import GalleryScreen from './screens/GalleryScreen'
import SettingsScreen from './screens/SettingsScreen'
import SV1Saved from './screens/SV1Saved'
import T1Tips from './screens/T1Tips'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/',           element: <S1Home /> },
      { path: '/directory',  element: <KD1KrishiDirectory /> },
      { path: '/gallery',    element: <GalleryScreen /> },
      { path: '/settings',   element: <SettingsScreen /> },
      { path: '/saved',      element: <SV1Saved /> },
      { path: '/tips',       element: <T1Tips /> },
      { path: '/disease/:key', element: <DS1DiseaseDetail /> },
    ],
  },
  // Fullscreen flows — no bottom nav
  { path: '/camera',    element: <CGCamera /> },
  { path: '/result',    element: <S6ResultAction /> },
  { path: '/no-match',  element: <SNMNoMatch /> },
])
