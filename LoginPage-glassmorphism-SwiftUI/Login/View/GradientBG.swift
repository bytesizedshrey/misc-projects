//
//  GradientBG.swift
//  Login
//
//  Created by Shreyash Gajbhiye on 17/08/23.
//

import SwiftUI

struct GradientBackgroundView: View {
    var body: some View {
        LinearGradient(gradient: Gradient(colors: [Color(hex: "dd1818"), Color(hex: "333333")]),
                       startPoint: .leading, endPoint: .trailing)
            .edgesIgnoringSafeArea(.all)
    }
}

extension Color {
    init(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

        var rgb: UInt64 = 0

        Scanner(string: hexSanitized).scanHexInt64(&rgb)

        self.init(
            red: Double((rgb & 0xFF0000) >> 16) / 255.0,
            green: Double((rgb & 0x00FF00) >> 8) / 255.0,
            blue: Double(rgb & 0x0000FF) / 255.0
        )
    }
}

//@main
//struct ContentViewApp: App {
//    var body: some Scene {
//        WindowGroup {
//            GradientBackgroundView()
//        }
//    }
//}
