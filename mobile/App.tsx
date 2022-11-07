import { NativeBaseProvider, StatusBar } from 'native-base'
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold
} from '@expo-google-fonts/roboto'

/**
 * Contexts.
 */
import { AuthContextProvider } from './src/contexts/AuthContext'

/**
 * Screens.
 */
import { Routes } from './src/routes'

/**
 * Components.
 */
import { Loading } from './src/components/Loading'

/**
 * Styles.
 */
import { THEME } from './src/styles/theme'

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold
  })

  return (
    <NativeBaseProvider theme={THEME}>
      <AuthContextProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  )
}
