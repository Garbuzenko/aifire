export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runAutoTests } = await import('../utils/autotests');
    await runAutoTests();
  }
}
