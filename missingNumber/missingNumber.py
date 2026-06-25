class Solution(object):
    def missingNumber(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        n = len(nums)
        sum_of_n = int(n * (n+1)/2) #[0,1,2,3]
        sum_of_nums = 0
        print(sum_of_n)
        #[3,0,1]
        for i in range(0,n):
            sum_of_nums += nums[i]
        return sum_of_n - sum_of_nums