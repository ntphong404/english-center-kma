package vn.edu.actvn.server.utils;

import java.util.Random;

public class RandomAvatar {

    private static final String[] MALE_AVATARS = {
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421934/a1_vjvzvi.jpg",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421934/a2_ijcztx.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421934/a3_sofakb.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421934/a4_ytcbcj.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421935/a5_brle0w.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421935/a6_ae7dy2.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421935/a7_fla3mj.png"
    };

    private static final String[] FEMALE_AVATARS = {
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421934/b1_fyv9lg.jpg",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421935/b2_qgus09.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421935/b3_vpo5o2.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421936/b4_cn7m9p.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421936/b5_cjcoap.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421936/b6_rkzxic.png",
            "https://res.cloudinary.com/dnsve3y1o/image/upload/v1750421936/b7_vvmzv2.png"
    };

    private static final Random RANDOM = new Random();

    public static String getRandomMaleAvatar() {
        return MALE_AVATARS[RANDOM.nextInt(MALE_AVATARS.length)];
    }

    public static String getRandomFemaleAvatar() {
        return FEMALE_AVATARS[RANDOM.nextInt(FEMALE_AVATARS.length)];
    }

    public static String getRandomAvatar(boolean isMale) {
        return isMale ? getRandomMaleAvatar() : getRandomFemaleAvatar();
    }
}
