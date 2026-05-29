/** Open an extension HTML page in a new tab (privacy, etc.). */
export async function openExtensionPage(
  path: '/options.html' | '/privacy.html' | '/popup.html' | '/sidepanel.html',
  active = true,
): Promise<void> {
  const url = browser.runtime.getURL(path);
  await browser.tabs.create({ url, active });
}
