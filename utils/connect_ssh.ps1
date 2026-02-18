# SSH connection script for yc-user@89.169.161.170
$sshPath = "C:\Windows\System32\OpenSSH\ssh.exe"
$keyPath = "C:\Users\mike\.ssh\ssh-key-1763498729276"
$target = "yc-user@89.169.161.170"

Write-Host "Connecting to $target using key $keyPath..."
& $sshPath -i $keyPath $target
