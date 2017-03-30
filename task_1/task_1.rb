IO.foreach("2014-09-03.log") do |line|
  if line.match(/status=404/) != nil
    if line.match(/router/)
      temp = line.split
      url = temp[12][5..-1] + temp[11][6..-1].chop
      puts url
    else
      temp = line.split
      url = temp[14][5..-1]
      puts url
    end
  end
end
