time_info=""
old_time_info="!old"
command=(bash build.sh)

update_time_info(){
    time_info=$(find src/ sil.txt *.sh scripts/*.js -type f,d -print0 | xargs -0 stat -c %Y)
}

save_old_time_info(){
    old_time_info="$time_info"
}

check_and_rebuild(){
    update_time_info
    if [ "$time_info" != "$old_time_info" ]; then
        save_old_time_info
        build_dist
    fi
}

build_dist(){
    local startTime endTime code interval
    clear
    echo "[rebuild] $(date)"
    echo "[build] ${command[*]}"
    startTime=$(date +%s)
    ${command[@]}
    code=$?
    endTime=$(date +%s)
    interval=$((endTime-startTime))
    echo "[build] exit with $code in ${interval}s"
    echo "[rebuild] wait for file changes"
}

check_and_rebuild
while sleep 3; do
    check_and_rebuild
done
