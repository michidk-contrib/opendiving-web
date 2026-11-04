#!/usr/bin/env bash
set -euo pipefail

version=${1:?Usage: install-trivy.sh VERSION BIN_DIR}
bin_dir=${2:?Usage: install-trivy.sh VERSION BIN_DIR}
if [[ ! $version =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Expected an exact Trivy release version, such as v0.76.1" >&2
  exit 1
fi
case "$(uname -sm)" in
  'Linux x86_64') architecture=64bit ;;
  'Linux aarch64') architecture=ARM64 ;;
  *) echo 'Unsupported Trivy runner platform' >&2; exit 1 ;;
esac

archive="trivy_${version#v}_Linux-${architecture}.tar.gz"
checksums="trivy_${version#v}_checksums.txt"
release_url="https://github.com/aquasecurity/trivy/releases/download/$version"
download_dir=$(mktemp -d)
trap 'rm -rf "$download_dir"' EXIT

# The upstream installer's get.trivy.dev redirect can be unavailable independently of GitHub.
for asset in "$archive" "$checksums"; do
  curl --fail --show-error --silent --location \
    --retry 3 --retry-all-errors --connect-timeout 15 --max-time 120 \
    --output "$download_dir/$asset" "$release_url/$asset"
done
(
  cd "$download_dir"
  awk -v archive="$archive" '$2 == archive { print }' "$checksums" > checksum.txt
  sha256sum --check --strict checksum.txt
  tar -xzf "$archive" trivy
)
install -d "$bin_dir"
install -m 0755 "$download_dir/trivy" "$bin_dir/trivy"
"$bin_dir/trivy" --version
if [[ -n ${GITHUB_PATH:-} ]]; then
  printf '%s\n' "$bin_dir" >> "$GITHUB_PATH"
fi
