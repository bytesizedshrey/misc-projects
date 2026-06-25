//
//  ConvexGlass.swift
//  Login
//
//  Created by Shreyash Gajbhiye on 17/08/23.
//

import SwiftUI

struct ConvexGlass: ViewModifier {
  func body(content: Content) -> some View {
    if #available(iOS 15.0, *) {
              content
                  .padding()
                  .frame(height: 50)
                  .background(.ultraThinMaterial)
                  .cornerRadius(14)
                  .shadow(color: .white.opacity(0.65), radius: 1, x: -1, y: -2)
                  .shadow(color: .black.opacity(0.65), radius: 2, x: 2, y: 2)
          } else {
              // Fallback on earlier versions
              content
                  .padding()
                  .frame(height: 50)
                  .cornerRadius(14)
                  .shadow(color: .white, radius: 3, x: -3, y: -3)
                  .shadow(color: .black, radius: 3, x: 3, y: 3)
          }
      }
}

//struct ConvexGlass_Previews: PreviewProvider {
//    static var previews: some View {
//        ConvexGlass()
//    }
//}
