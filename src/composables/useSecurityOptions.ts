interface Options {
  id: number
  name: string
  isActive: 0 | 1
}

let clickacjingSecurityEnabled = false
let xssSecurityEnabled = false

export const useSecurityOptions = () => {
  const init = async () => {
    const { api } = await import('src/boot/axios')

    try {
      const { data: options } = await api.get<Options[]>('/security')

      clickacjingSecurityEnabled =
        !!options.find((el) => el.name === 'clickjacking')?.isActive || false
      xssSecurityEnabled = !!options.find((el) => el.name === 'xss')?.isActive || false
    } catch (e) {
      console.warn(
        'Aby poprawnie działał front - musisz włączyć backend. Wynika to z faktu, że trzeba ustalić sesje + pobrać opcje zabezpieczeń.',
      )
    }
  }

  const setClickacjingSecurityEnabled = (newVal: boolean) => {
    clickacjingSecurityEnabled = newVal
  }

  const setXssSecurityEnabled = (newVal: boolean) => {
    xssSecurityEnabled = newVal
  }

  return {
    clickacjingSecurityEnabled,
    xssSecurityEnabled,
    setClickacjingSecurityEnabled,
    setXssSecurityEnabled,
    init,
  }
}
