import Link from "next/link";

export default function Page() {
  return (
    <div>
      <Link href='/login'>Login</Link>
      <br />
      <Link href='/register'>Register</Link>
      <br />
      <Link href='/home'>Home</Link>
    </div>
  )
}