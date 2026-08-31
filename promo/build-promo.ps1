$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$frames = Join-Path $PSScriptRoot "frames"
$outDir = $PSScriptRoot
$src = "$env:LOCALAPPDATA\Temp\cursor\screenshots"
$font = "C:/Windows/Fonts/segoeuib.ttf"
$fontReg = "C:/Windows/Fonts/segoeui.ttf"

New-Item -ItemType Directory -Force -Path $frames | Out-Null

$shots = @(
  "promo-01-hero.png",
  "promo-02-services.png",
  "promo-03-portfolio.png",
  "promo-04-contact.png"
)

foreach ($name in $shots) {
  $from = Join-Path $src $name
  if (-not (Test-Path $from)) { throw "Missing screenshot: $from" }
  Copy-Item $from (Join-Path $frames $name) -Force
}

$zoom = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0012,1.12)':d=105:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30,format=yuv420p"
$tmp = Join-Path $outDir "_tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

function Make-Intro {
  $out = Join-Path $tmp "00-intro.mp4"
  ffmpeg -y -f lavfi -i "color=c=0x0f0a1e:s=1080x1920:d=3.5:r=30" `
    -vf "drawtext=fontfile='$font':text='webstranicelo':fontsize=92:fontcolor=white:x=(w-text_w)/2:y=(h/2)-120,drawtext=fontfile='$fontReg':text='Creative Web Studio':fontsize=52:fontcolor=0xA78BFA:x=(w-text_w)/2:y=(h/2)+10,drawtext=fontfile='$fontReg':text='3D animacije • Premium sajtovi':fontsize=34:fontcolor=0xC4B5FD:x=(w-text_w)/2:y=(h/2)+80,fade=t=in:st=0:d=0.8,fade=t=out:st=2.7:d=0.8" `
    -c:v libx264 -pix_fmt yuv420p $out
  return $out
}

function Make-Shot($idx, $file, $caption) {
  $out = Join-Path $tmp ("{0:D2}-{1}.mp4" -f $idx, $file.Replace(".png",""))
  $in = Join-Path $frames $file
  ffmpeg -y -loop 1 -i $in `
    -vf "$zoom,drawtext=fontfile='$fontReg':text='$caption':fontsize=38:fontcolor=white@0.95:box=1:boxcolor=0x000000@0.45:boxborderw=18:x=(w-text_w)/2:y=h-140,fade=t=in:st=0:d=0.5,fade=t=out:st=2.5:d=0.5" `
    -t 3 -c:v libx264 -pix_fmt yuv420p $out
  return $out
}

function Make-Outro {
  $out = Join-Path $tmp "05-outro.mp4"
  ffmpeg -y -f lavfi -i "color=c=0x130a2e:s=1080x1920:d=4:r=30" `
    -vf "drawtext=fontfile='$font':text='Zatraži sajt':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h/2)-150,drawtext=fontfile='$fontReg':text='webstranicelo.github.io/webstranicelo':fontsize=34:fontcolor=0x818CF8:x=(w-text_w)/2:y=(h/2)-40,drawtext=fontfile='$fontReg':text='@web_stranicelo':fontsize=42:fontcolor=0xC084FC:x=(w-text_w)/2:y=(h/2)+40,fade=t=in:st=0:d=0.6,fade=t=out:st=3.2:d=0.8" `
    -c:v libx264 -pix_fmt yuv420p $out
  return $out
}

$parts = @(
  (Make-Intro),
  (Make-Shot 1 "promo-01-hero.png" "Scroll-driven 3D animacije"),
  (Make-Shot 2 "promo-02-services.png" "Landing • Biznis • WebGL"),
  (Make-Shot 3 "promo-03-portfolio.png" "Primeri projekata"),
  (Make-Shot 4 "promo-04-contact.png" "Kontakt na Instagram"),
  (Make-Outro)
)

$list = Join-Path $tmp "concat.txt"
$parts | ForEach-Object { "file '$($_.Replace('\','/'))'" } | Set-Content -Path $list -Encoding ascii

$final = Join-Path $outDir "webstranicelo-promo-reels.mp4"
ffmpeg -y -f concat -safe 0 -i $list -c copy $final

Write-Host "Created: $final"
