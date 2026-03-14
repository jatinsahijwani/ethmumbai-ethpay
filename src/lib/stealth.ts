import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 } from '@noble/hashes/sha256'
import { keccak_256 } from '@noble/hashes/sha3'
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils'

export function generateStealthKeypair() {
  const spendPrivKeyBytes = randomBytes(32)
  const viewPrivKeyBytes = randomBytes(32)

  const spendPrivKey = bytesToHex(spendPrivKeyBytes)
  const viewPrivKey = bytesToHex(viewPrivKeyBytes)

  const spendPubKey = bytesToHex(secp256k1.getPublicKey(spendPrivKeyBytes, true))
  const viewPubKey = bytesToHex(secp256k1.getPublicKey(viewPrivKeyBytes, true))

  return { spendPrivKey, spendPubKey, viewPrivKey, viewPubKey }
}

function deriveEthAddress(pubKeyUncompressed: Uint8Array): string {
  // Remove 0x04 prefix, hash with keccak256, take last 20 bytes
  const hash = keccak_256(pubKeyUncompressed.slice(1))
  return '0x' + bytesToHex(hash.slice(12))
}

export function generateStealthAddress(
  recipientSpendPub: string,
  recipientViewPub: string,
): { address: string; ephemeralPubKey: string } {
  // 1. Generate ephemeral keypair (one-time, per payment)
  const ephemeralPrivBytes = randomBytes(32)
  const ephemeralPubBytes = secp256k1.getPublicKey(ephemeralPrivBytes, true)

  // 2. ECDH: sharedSecret = viewPub * ephemeralPriv
  const sharedSecretPoint = secp256k1.getSharedSecret(
    ephemeralPrivBytes,
    hexToBytes(recipientViewPub)
  )

  // 3. Hash the shared secret
  const sharedSecretHash = sha256(sharedSecretPoint)

  // 4. stealthPub = spendPub + hash*G  (EIP-5564)
  const spendPoint = secp256k1.ProjectivePoint.fromHex(recipientSpendPub)
  const tweak = secp256k1.ProjectivePoint.BASE.multiply(
    BigInt('0x' + bytesToHex(sharedSecretHash))
  )
  const stealthPoint = spendPoint.add(tweak)
  const stealthPubUncompressed = stealthPoint.toRawBytes(false)

  // 5. Derive Ethereum address
  const address = deriveEthAddress(stealthPubUncompressed)

  return {
    address,
    ephemeralPubKey: bytesToHex(ephemeralPubBytes),
  }
}

export function scanStealthAddress(
  stealthAddress: string,
  ephemeralPubKey: string,
  viewPrivKey: string,
  spendPubKey: string,
): boolean {
  try {
    // 1. Recompute shared secret using recipient's view private key
    const sharedSecretPoint = secp256k1.getSharedSecret(
      hexToBytes(viewPrivKey),
      hexToBytes(ephemeralPubKey)
    )

    // 2. Hash it
    const sharedSecretHash = sha256(sharedSecretPoint)

    // 3. Recompute expected stealth address
    const spendPoint = secp256k1.ProjectivePoint.fromHex(spendPubKey)
    const tweak = secp256k1.ProjectivePoint.BASE.multiply(
      BigInt('0x' + bytesToHex(sharedSecretHash))
    )
    const expectedStealthPoint = spendPoint.add(tweak)
    const expectedStealthPub = expectedStealthPoint.toRawBytes(false)
    const expectedAddress = deriveEthAddress(expectedStealthPub)

    return expectedAddress.toLowerCase() === stealthAddress.toLowerCase()
  } catch {
    return false
  }
}