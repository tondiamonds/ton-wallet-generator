import TonWeb from 'tonweb'

import { useMemo, useState } from 'preact/hooks'
import { KeyPair } from 'tonweb-mnemonic'
import { useAsync } from 'react-async-hook'

import Wallet from './components/wallet'
import { IWallet } from './types'
import { getProvider } from './utils'
import { WalletGenerator } from './components/WalletGenerator'
import { WalletsTable } from './components/WalletsTable'
import { NetworkSettings } from './components/NetworkSettings'

// const provider = new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC')

export function App() {
  const [words, setWords] = useState<string[]>([])
  const [wallet, setWallet] = useState<IWallet | undefined>(undefined)
  const [keyPair, setKeyPair] = useState<KeyPair | undefined>(undefined)

  const [testnet, setTestnet] = useState(true)
  const [apiKey, setApiKey] = useState<string>('')

  const provider = useMemo(() => getProvider(apiKey, testnet), [apiKey, testnet])

  const wallets = useAsync<IWallet[]>(async () => {
    if (!keyPair) {
      return []
    }

    // eslint-disable-next-line new-cap
    const walletv3R1 = new TonWeb.Wallets.all.v3R1(provider, { publicKey: keyPair.publicKey })
    const v3R1Address = await walletv3R1.getAddress()

    // eslint-disable-next-line new-cap
    const walletv3R2 = new TonWeb.Wallets.all.v3R2(provider, { publicKey: keyPair.publicKey })
    const v3R2Address = await walletv3R2.getAddress()

    // eslint-disable-next-line new-cap
    const walletv4R2 = new TonWeb.Wallets.all.v4R2(provider, { publicKey: keyPair.publicKey })
    const v4R2Address = await walletv4R2.getAddress()

    return [
      {
        type: 'v4R2',
        address: v4R2Address,
        balance: '0',
        wallet: walletv4R2,
        key: keyPair,
      },
      {
        type: 'v3R2',
        address: v3R2Address,
        balance: '0',
        wallet: walletv3R2,
        key: keyPair,
      },
      {
        type: 'v3R1',
        address: v3R1Address,
        balance: '0',
        wallet: walletv3R1,
        key: keyPair,
      },
    ]
  }, [keyPair])

  const walletsToShow = wallets.result

  return (
    <div className="flex justify-center flex-col md:flex-row">
      <div className="md:max-w-xl w-full px-4 flex flex-col mt-8">
        <h1 className="font-bold text-xl text-accent">TON Wallet</h1>

        <NetworkSettings
          testnet={testnet}
          apiKey={apiKey}
          setTestnet={setTestnet}
          setApiKey={setApiKey}
        />

        <WalletGenerator
          words={words}
          setWords={setWords}
          setWallet={setWallet}
          setKeyPair={setKeyPair}
        />

        <WalletsTable
          currentWallet={wallet}
          walletsToShow={walletsToShow}
          testnet={testnet}
          setWallet={setWallet}
        />
      </div>
      <div className="md:max-w-xl w-full px-4 flex flex-col mt-16">
        {wallet ? (
          <Wallet wallet={wallet} testnet={testnet} apiKey={apiKey} />
        ) : (
          <div>Click 'Use this wallet' on wallet you want to use</div>
        )}
      </div>
    </div>
  )
}
